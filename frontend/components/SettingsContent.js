'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingIndicator from './LoadingIndicator';
import Image from 'next/image';
import api from '../lib/api';
import axios from 'axios';

export default function SettingsContent() {
    const router = useRouter();
    const { user, isAuthenticated, loading, logout, ensureTokenInHeaders, refreshUserData } = useAuth();
    const { showSuccess, showError, showWarning } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(null); // 'profile' or 'cover'
    const [settings, setSettings] = useState({
        notifications: true,
        emailUpdates: true,
        profileVisibility: 'public'
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [usernameValidation, setUsernameValidation] = useState({
        isValid: true,
        message: '',
        isChecking: false
    });
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isSavingUsername, setIsSavingUsername] = useState(false);
    const [profileSettings, setProfileSettings] = useState({
        username: '',
        displayName: '',
        bio: '',
        profilePicture: '',
        backgroundImage: '',
        socialLinks: [],
        allowMessages: true,
        contactEmail: '',
        showTemplateCount: true,
        // Specialties field
        specialties: [],
        newSpecialty: ''
    });

    useEffect(() => {
        // Load profile settings if user is authenticated
        if (!loading && isAuthenticated && user) {
            loadProfileSettings();
        }
    }, [isAuthenticated, loading, user]);

    const loadProfileSettings = async () => {
        try {
            ensureTokenInHeaders();
            const response = await api.get('/auth/profile/settings');
            if (response.data && response.data.success) {
                const profileData = response.data.data;
                setProfileSettings(prev => ({
                    ...prev,
                    ...profileData,
                    username: profileData.username || user?.username || '',
                    displayName: profileData.displayName || user?.name || '',
                    bio: profileData.bio || '',
                    profilePicture: profileData.profilePicture || user?.profilePicture || '',
                    backgroundImage: profileData.backgroundImage || user?.backgroundImage || '',
                    socialLinks: Array.isArray(profileData.socialLinks) ? profileData.socialLinks : [],
                    // Specialties field
                    specialties: Array.isArray(profileData.specialties) ? profileData.specialties : (Array.isArray(user?.specialties) ? user.specialties : [])
                }));
            }
        } catch (error) {
            console.error('Error loading profile settings:', error);
            // Initialize with user data if API fails
            setProfileSettings(prev => ({
                ...prev,
                username: user?.username || '',
                displayName: user?.name || '',
                bio: user?.bio || '',
                profilePicture: user?.profilePicture || '',
                backgroundImage: user?.backgroundImage || '',
                socialLinks: Array.isArray(user?.socialLinks) ? user.socialLinks : [],
                // Specialties field
                specialties: Array.isArray(user?.specialties) ? user.specialties : []
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
        // Here you would typically save to backend
    };

    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (passwordErrors[field]) {
            setPasswordErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validatePasswordForm = () => {
        const errors = {};

        if (!passwordData.currentPassword) {
            errors.currentPassword = 'كلمة المرور الحالية مطلوبة';
        }

        if (!passwordData.newPassword) {
            errors.newPassword = 'كلمة المرور الجديدة مطلوبة';
        } else if (passwordData.newPassword.length < 6) {
            errors.newPassword = 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
            errors.newPassword = 'كلمة المرور الجديدة يجب أن تحتوي على حرف صغير وحرف كبير ورقم واحد على الأقل';
        }

        if (!passwordData.confirmPassword) {
            errors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'تأكيد كلمة المرور لا يطابق كلمة المرور الجديدة';
        }

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChangePassword = async () => {
        if (!validatePasswordForm()) {
            return;
        }

        try {
            setIsChangingPassword(true);

            const response = await api.post('/auth/change-password', passwordData);

            if (response.data.success) {
                showSuccess('تم تغيير كلمة المرور بنجاح');
                setShowPasswordModal(false);
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setPasswordErrors({});
            }
        } catch (error) {
            console.error('Change password error:', error);
            const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور';
            showError(errorMessage);
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Username validation function
    const validateUsername = (username) => {
        const errors = [];

        if (!username || username.trim() === '') {
            errors.push('اسم المستخدم مطلوب');
        } else {
            if (username.length < 3) {
                errors.push('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
            }
            if (username.length > 20) {
                errors.push('اسم المستخدم يجب أن يكون أقل من 20 حرف');
            }
            if (!/^[a-z0-9_]+$/.test(username)) {
                errors.push('اسم المستخدم يجب أن يحتوي على أحرف صغيرة وأرقام وشرطة سفلية فقط');
            }
            if (username.startsWith('_') || username.endsWith('_')) {
                errors.push('اسم المستخدم لا يمكن أن يبدأ أو ينتهي بشرطة سفلية');
            }
            if (username.includes('__')) {
                errors.push('اسم المستخدم لا يمكن أن يحتوي على شرطتين سفليتين متتاليتين');
            }
            // Check for reserved usernames
            const reservedUsernames = ['admin', 'api', 'www', 'mail', 'ftp', 'root', 'support', 'help', 'contact', 'about', 'terms', 'privacy', 'login', 'signup', 'register', 'dashboard', 'profile', 'settings', 'account', 'user', 'users', 'creator', 'creators', 'template', 'templates', 'blog', 'news', 'home', 'index', 'main', 'app', 'site', 'web', 'online', 'service', 'services'];
            if (reservedUsernames.includes(username.toLowerCase())) {
                errors.push('هذا الاسم محجوز ولا يمكن استخدامه');
            }
        }

        return {
            isValid: errors.length === 0,
            message: errors[0] || '',
            errors: errors
        };
    };

    // Check username availability
    const checkUsernameAvailability = async (username) => {
        if (!username || username.trim() === '') {
            setUsernameValidation({ isValid: true, message: '', isChecking: false });
            return;
        }

        const validation = validateUsername(username);
        if (!validation.isValid) {
            setUsernameValidation({ ...validation, isChecking: false });
            return;
        }

        // If the username is the same as current user's username, it's valid
        if (username.toLowerCase() === user?.username?.toLowerCase()) {
            setUsernameValidation({ isValid: true, message: 'اسم المستخدم الحالي', isChecking: false });
            return;
        }


        try {
            setUsernameValidation(prev => ({ ...prev, isChecking: true }));
            ensureTokenInHeaders();

            // Create a clean axios instance without interceptors for username checking
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
                (process.env.NODE_ENV === 'production' ? 'https://notion-arabs-fe5b3f214071.herokuapp.com/api' : 'http://localhost:5000/api');

            const cleanAxios = axios.create({
                baseURL: API_BASE_URL,
                headers: {
                    'Content-Type': 'application/json',
                    ...(api.defaults.headers.common['Authorization'] && {
                        'Authorization': api.defaults.headers.common['Authorization']
                    })
                },
                validateStatus: (status) => status < 500 // Accept all status codes below 500
            });

            const response = await cleanAxios.get(`/auth/check-username/${username}`);

            if (response.status === 200) {
                // Username is available
                setUsernameValidation({ isValid: true, message: 'اسم المستخدم متاح', isChecking: false });
            } else if (response.status === 409) {
                // Username is not available (already taken or reserved)
                const errorMessage = response.data?.message || 'اسم المستخدم غير متاح';
                setUsernameValidation({ isValid: false, message: errorMessage, isChecking: false });
            } else if (response.status === 400) {
                // Handle validation errors from backend
                const errorMessage = response.data?.message || 'اسم المستخدم غير صحيح';
                setUsernameValidation({ isValid: false, message: errorMessage, isChecking: false });
            } else {
                setUsernameValidation({ isValid: false, message: 'خطأ في التحقق من اسم المستخدم', isChecking: false });
            }
        } catch (error) {
            console.error('Error checking username:', error);
            setUsernameValidation({ isValid: false, message: 'خطأ في التحقق من اسم المستخدم', isChecking: false });
        }
    };

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setProfileSettings(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setProfileSettings(prev => ({
                ...prev,
                [field]: value
            }));

            // Handle username validation
            if (field === 'username') {
                const validation = validateUsername(value);

                // If it's the same as current username, it's valid
                if (value.toLowerCase() === user?.username?.toLowerCase()) {
                    setUsernameValidation({
                        isValid: true,
                        message: 'اسم المستخدم الحالي',
                        isChecking: false
                    });
                } else {
                    // Only set as checking if validation passes and it's not empty
                    setUsernameValidation({
                        ...validation,
                        isChecking: validation.isValid && value.trim() !== ''
                    });
                }
            }
        }
    };

    const addSocialLink = () => {
        setProfileSettings(prev => ({
            ...prev,
            socialLinks: [...prev.socialLinks, { url: '' }]
        }));
    };

    const removeSocialLink = (index) => {
        setProfileSettings(prev => ({
            ...prev,
            socialLinks: prev.socialLinks.filter((_, i) => i !== index)
        }));
    };

    const updateSocialLink = (index, value) => {
        setProfileSettings(prev => ({
            ...prev,
            socialLinks: prev.socialLinks.map((link, i) =>
                i === index ? { url: value } : link
            )
        }));
    };

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const isValidSocialMediaUrl = (url) => {
        if (!url) return false;
        // Accept any string that looks like a domain or URL
        return url.trim().length > 0;
    };

    const detectPlatform = (url) => {
        if (!url) return null;

        const urlLower = url.toLowerCase();

        if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
            return { name: 'twitter', icon: 'twitter', color: 'text-blue-400' };
        }
        if (urlLower.includes('instagram.com')) {
            return { name: 'instagram', icon: 'instagram', color: 'text-pink-500' };
        }
        if (urlLower.includes('linkedin.com')) {
            return { name: 'linkedin', icon: 'linkedin', color: 'text-blue-600' };
        }
        if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
            return { name: 'youtube', icon: 'youtube', color: 'text-red-500' };
        }
        if (urlLower.includes('facebook.com')) {
            return { name: 'facebook', icon: 'facebook', color: 'text-blue-600' };
        }
        if (urlLower.includes('tiktok.com')) {
            return { name: 'tiktok', icon: 'tiktok', color: 'text-black dark:text-white' };
        }
        if (urlLower.includes('snapchat.com')) {
            return { name: 'snapchat', icon: 'snapchat', color: 'text-yellow-500' };
        }
        if (urlLower.includes('telegram.org') || urlLower.includes('t.me')) {
            return { name: 'telegram', icon: 'telegram', color: 'text-blue-500' };
        }
        if (urlLower.includes('discord.com') || urlLower.includes('discord.gg')) {
            return { name: 'discord', icon: 'discord', color: 'text-indigo-500' };
        }
        if (urlLower.includes('github.com')) {
            return { name: 'github', icon: 'github', color: 'text-gray-800 dark:text-gray-200' };
        }
        if (urlLower.includes('behance.net')) {
            return { name: 'behance', icon: 'behance', color: 'text-blue-600' };
        }
        if (urlLower.includes('dribbble.com')) {
            return { name: 'dribbble', icon: 'dribbble', color: 'text-pink-500' };
        }

        return { name: 'website', icon: 'website', color: 'text-gray-400' };
    };

    const getPlatformIcon = (platform) => {
        const icons = {
            twitter: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
            instagram: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
            ),
            linkedin: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            ),
            youtube: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
            ),
            facebook: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            ),
            tiktok: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
            ),
            snapchat: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z" />
                </svg>
            ),
            telegram: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
            ),
            discord: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
            ),
            behance: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M0 7.5v9A7.5 7.5 0 0 0 7.5 24h9a7.5 7.5 0 0 0 7.5-7.5v-9A7.5 7.5 0 0 0 16.5 0h-9A7.5 7.5 0 0 0 0 7.5zM7.5 3.75a3.75 3.75 0 0 1 3.75 3.75v9a3.75 3.75 0 0 1-3.75 3.75v-16.5zM16.5 3.75a3.75 3.75 0 0 1 3.75 3.75v9a3.75 3.75 0 0 1-3.75 3.75v-16.5z" />
                </svg>
            ),
            dribbble: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm6.568 4.5c1.5 2.5 2.432 5.4 2.432 8.5 0 1.5-.3 3-.8 4.4-1.5-.5-3.1-.8-4.8-.8-1.5 0-3 .3-4.4.8-.5-1.4-.8-2.9-.8-4.4 0-3.1.9-6 2.4-8.5 2.5 1.5 4.5 3.5 6 6zM12 3c2.5 0 4.8 1 6.5 2.6-1.5 2.5-3.5 4.5-6 6-2.5-1.5-4.5-3.5-6-6C7.2 4 9.5 3 12 3zm-9.5 9c0-1.5.3-3 .8-4.4 1.5.5 3.1.8 4.8.8 1.5 0 3-.3 4.4-.8.5 1.4.8 2.9.8 4.4 0 3.1-.9 6-2.4 8.5-2.5-1.5-4.5-3.5-6-6-1.5-2.5-2.4-5.4-2.4-8.5z" />
                </svg>
            ),
            github: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
            ),
            website: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
            )
        };

        return icons[platform] || icons.website;
    };

    // Debounced username availability check
    useEffect(() => {
        if (profileSettings.username) {

            // If it's the same as current username, it's valid
            if (profileSettings.username.toLowerCase() === user?.username?.toLowerCase()) {
                setUsernameValidation({
                    isValid: true,
                    message: 'اسم المستخدم الحالي',
                    isChecking: false
                });
                return;
            }

            const validation = validateUsername(profileSettings.username);
            if (validation.isValid) {
                // Only make API call if username passes all frontend validation
                const timeoutId = setTimeout(() => {
                    checkUsernameAvailability(profileSettings.username);
                }, 500);
                return () => clearTimeout(timeoutId);
            } else {
                // If validation fails, clear any checking state
                setUsernameValidation(prev => ({ ...prev, isChecking: false }));
            }
        }
    }, [profileSettings.username, user?.username]);

    const handleImageUpload = async (event, type = 'profile') => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
            return;
        }

        const formData = new FormData();
        const isProfile = type === 'profile';
        formData.append(isProfile ? 'profilePicture' : 'backgroundImage', file);

        try {
            setUploadingImage(isProfile ? 'profile' : 'cover');
            ensureTokenInHeaders();

            // Map the type to the correct endpoint
            const endpoint = isProfile ? '/upload/profile-picture' : '/upload/backgroundImage';

            const response = await api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setProfileSettings(prev => ({
                ...prev,
                [isProfile ? 'profilePicture' : 'backgroundImage']: response.data.url
            }));
            showSuccess(isProfile ? 'تم تحديث صورة الملف الشخصي بنجاح' : 'تم تحديث صورة الغلاف بنجاح');
        } catch (error) {
            console.error('Error uploading image:', error);
            showError('حدث خطأ في رفع الصورة');
        } finally {
            setUploadingImage(null);
        }
    };

    const handleSaveUsername = async () => {
        try {
            setIsSavingUsername(true);
            ensureTokenInHeaders();

            // Check if username has actually changed
            const originalUsername = user?.username || '';
            const newUsername = profileSettings.username;

            if (newUsername === originalUsername) {
                // No changes made, just close edit mode
                showSuccess('لم يتم تغيير اسم المستخدم');
                setIsEditingUsername(false);
                setUsernameValidation({ isValid: true, message: '', isChecking: false });
                setIsSavingUsername(false);
                return;
            }

            // Validate username before saving
            const validation = validateUsername(profileSettings.username);
            if (!validation.isValid) {
                showError(validation.message);
                setIsSavingUsername(false);
                return;
            }

            // Check availability one more time
            try {
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
                    (process.env.NODE_ENV === 'production' ? 'https://api.notionarabs.com/api' : 'http://localhost:5000/api');

                const cleanAxios = axios.create({
                    baseURL: API_BASE_URL,
                    headers: {
                        'Content-Type': 'application/json',
                        ...(api.defaults.headers.common['Authorization'] && {
                            'Authorization': api.defaults.headers.common['Authorization']
                        })
                    },
                    validateStatus: (status) => status < 500 // Accept all status codes below 500
                });

                const response = await cleanAxios.get(`/auth/check-username/${profileSettings.username}`);

                if (response.status === 200) {
                    // Username is available, continue with save
                } else if (response.status === 409) {
                    const errorMessage = response.data?.message || 'اسم المستخدم غير متاح';
                    showError(errorMessage);
                    setIsSavingUsername(false);
                    return;
                } else if (response.status === 400) {
                    const errorMessage = response.data?.message || 'اسم المستخدم غير صحيح';
                    showError(errorMessage);
                    setIsSavingUsername(false);
                    return;
                } else {
                    showError('خطأ في التحقق من اسم المستخدم');
                    setIsSavingUsername(false);
                    return;
                }
            } catch (error) {
                console.error('Error checking username during save:', error);
                showError('خطأ في التحقق من اسم المستخدم');
                setIsSavingUsername(false);
                return;
            }

            // Save only the username
            await api.put('/auth/profile/settings', { username: profileSettings.username });
            showSuccess('تم حفظ اسم المستخدم بنجاح!');
            // Ensure auth context reflects the new username
            try { await refreshUserData(); } catch { }
            setIsEditingUsername(false);
            setUsernameValidation({ isValid: true, message: '', isChecking: false });
        } catch (error) {
            console.error('Error saving username:', error);

            if (error.response?.data?.errors) {
                // Show specific validation errors
                const firstError = error.response.data.errors[0];
                showError(firstError.msg || 'حدث خطأ في حفظ اسم المستخدم');
            } else if (error.response?.data?.message) {
                showError(error.response.data.message);
            } else {
                showError('حدث خطأ في حفظ اسم المستخدم');
            }
        } finally {
            setIsSavingUsername(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            ensureTokenInHeaders();

            // Clean up empty social links and validate URLs
            const cleanedSettings = {
                ...profileSettings,
                socialLinks: (profileSettings.socialLinks || []).filter(link => {
                    if (!link.url || !link.url.trim()) return false;
                    return isValidSocialMediaUrl(link.url);
                }),
                // Remove temporary fields
                newSpecialty: undefined
            };

            // Normalize/validate contactEmail: backend treats empty string as invalid; omit if empty or messages disabled
            const contact = (profileSettings.contactEmail || '').trim();
            if (!profileSettings.allowMessages || contact === '') {
                delete cleanedSettings.contactEmail;
            } else {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(contact)) {
                    showError('البريد الإلكتروني للتواصل غير صحيح');
                    setIsSaving(false);
                    return;
                }
                cleanedSettings.contactEmail = contact.toLowerCase();
            }

            await api.put('/auth/profile/settings', cleanedSettings);
            showSuccess('تم حفظ إعدادات الملف الشخصي بنجاح!');
            // Refresh user data so subsequent pages (e.g., /profile) show updated info
            try { await refreshUserData(); } catch { }
            // Redirect after a short delay to let the user see the success message
            setTimeout(() => {
                router.push('/profile');
            }, 300);
        } catch (error) {
            console.error('Error saving profile settings:', error);

            if (error.response?.data?.errors) {
                // Show specific validation errors
                const firstError = error.response.data.errors[0];
                showError(firstError.msg || 'حدث خطأ في حفظ الإعدادات');
            } else if (error.response?.data?.message) {
                showError(error.response.data.message);
            } else {
                showError('حدث خطأ في حفظ الإعدادات');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'حذف') {
            showError('يرجى كتابة "حذف" للتأكيد');
            return;
        }

        try {
            setIsDeleting(true);
            // Check if token is set
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('authToken='))
                ?.split('=')[1];

            // Ensure token is set in headers
            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } else {
                throw new Error('No authentication token found');
            }

            const response = await api.delete('/auth/account');

            if (response.data.success) {
                showSuccess('تم حذف حسابك بنجاح');
                setShowDeleteModal(false);

                // Small delay to show success message
                setTimeout(async () => {
                    // Logout user and redirect to home
                    await logout();
                    router.push('/');
                }, 1000);
            }
        } catch (error) {
            console.error('Delete account error:', error);

            const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حذف الحساب';
            showError(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div>
                {/* Header Skeleton */}
                <div className="mb-8 border-b border-gray-100 dark:border-dark-card-border pb-6 animate-pulse">
                    <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 mb-3"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-64"></div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                    {/* Main Settings Skeleton */}
                    <div className="xl:col-span-2 space-y-6 lg:space-y-8 animate-pulse">
                        <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl p-6 lg:p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-2xl bg-gray-200 dark:bg-gray-700"></div>
                                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
                                </div>
                                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
                                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Side Settings Skeleton */}
                    <div className="space-y-6 lg:space-y-8 animate-pulse">
                        <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl p-6 lg:p-8">
                            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                        <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="mb-8 border-b border-gray-100 dark:border-dark-card-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary mb-2 tracking-tight">
                        إعدادات الحساب
                    </h1>
                    <p className="text-base text-gray-600 dark:text-dark-text-secondary font-medium">
                        إدارة بياناتك الشخصية وتفضيلات حسابك في مكان واحد
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="group px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-orange-500 dark:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 dark:shadow-orange-500/10 hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2 self-start sm:self-center"
                >
                    {isSaving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                    {isSaving ? 'جاري الحفظ...' : 'حفظ جميع التغييرات'}
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                {/* Main Settings */}
                <div className="xl:col-span-2 space-y-6 lg:space-y-8">
                    {/* Profile Information */}
                    <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6 lg:p-8 bg-gray-50/50 dark:bg-dark-tertiary/20 border-b border-gray-100 dark:border-dark-card-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-primary-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">المعلومات الشخصية</h2>
                            </div>
                        </div>
                        <div className="p-6 lg:p-8 space-y-8">


                            {/* Images Section (Cover + Profile) */}
                            <div className="relative mb-8 group">
                                {/* Cover Image */}
                                <div className="relative h-48 w-full bg-gray-100 dark:bg-dark-tertiary rounded-xl overflow-hidden group/cover">
                                    {profileSettings.backgroundImage ? (
                                        <Image
                                            src={profileSettings.backgroundImage}
                                            alt="صورة الغلاف"
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover/cover:scale-105"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-dark-tertiary">
                                            <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Cover Upload Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
                                        <label
                                            htmlFor="cover-image-upload"
                                            className="cursor-pointer px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/50 rounded-lg text-white font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                                        >
                                            {uploadingImage === 'cover' ? (
                                                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                            )}
                                            <span>{uploadingImage === 'cover' ? 'جاري الرفع...' : 'تغيير الغلاف'}</span>
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'cover')}
                                            className="hidden"
                                            id="cover-image-upload"
                                        />
                                    </div>
                                </div>

                                {/* Profile Picture */}
                                <div className="absolute -bottom-10 right-6 sm:right-8">
                                    <div className="relative group/profile">
                                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-white dark:bg-dark-secondary shadow-lg">
                                            {profileSettings.profilePicture ? (
                                                <Image
                                                    src={profileSettings.profilePicture}
                                                    alt="صورة الملف الشخصي"
                                                    width={112}
                                                    height={112}
                                                    className="w-full h-full rounded-xl object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-600 flex items-center justify-center">
                                                    <span className="text-3xl sm:text-4xl font-black text-white">
                                                        {user?.name?.charAt(0)?.toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <label
                                            htmlFor="profile-picture-upload"
                                            className="absolute -bottom-2 -right-2 w-9 h-9 bg-white dark:bg-dark-tertiary rounded-xl border border-gray-100 dark:border-dark-card-border shadow-lg flex items-center justify-center text-gray-500 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-orange-400 hover:scale-110 cursor-pointer transition-all"
                                        >
                                            {uploadingImage === 'profile' ? (
                                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            )}
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'profile')}
                                            className="hidden"
                                            id="profile-picture-upload"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Spacing for overlapping profile picture */}
                            <div className="h-4"></div>

                            {/* Upload Rules */}
                            <div className="mb-8 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30 flex items-start gap-3">
                                <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                    <p className="font-bold">مواصفات الصور المطلوبة:</p>
                                    <ul className="list-disc list-inside space-y-0.5 opacity-90 font-medium">
                                        <li>صورة الغلاف: 1200×300 بكسل (PNG, JPG)</li>
                                        <li>صورة الملف الشخصي: 500×500 بكسل</li>
                                        <li>الحد الأقصى للحجم: 5 ميجابايت</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Username */}
                            <div className="space-y-3">
                                <label className="text-sm font-black text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    اسم المستخدم
                                </label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1 group">
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                            <span className="font-bold text-lg">@</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={profileSettings.username}
                                            onChange={(e) => handleInputChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                            disabled={!isEditingUsername}
                                            className={`w-full pl-4 pr-10 py-3.5 bg-white dark:bg-dark-tertiary border-2 rounded-2xl text-gray-900 dark:text-dark-text-primary font-bold placeholder-gray-400 focus:ring-0 transition-all duration-300 ${!isEditingUsername
                                                ? 'border-gray-100 dark:border-dark-card-border/50 bg-gray-50/50 dark:bg-dark-tertiary/50 cursor-not-allowed text-gray-500'
                                                : usernameValidation.isValid
                                                    ? 'border-gray-200 dark:border-dark-card-border focus:border-primary-500 dark:focus:border-orange-500'
                                                    : 'border-red-200 dark:border-red-900/50 focus:border-red-500'
                                                }`}
                                            placeholder="username"
                                        />
                                        {usernameValidation.isChecking && (
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                                                <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                        {!usernameValidation.isChecking && profileSettings.username && isEditingUsername && (
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                                                {usernameValidation.isValid ? (
                                                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Edit/Save/Cancel buttons */}
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        {!isEditingUsername ? (
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingUsername(true)}
                                                className="px-5 py-3.5 bg-white dark:bg-dark-tertiary border-2 border-gray-200 dark:border-dark-card-border rounded-2xl text-gray-600 dark:text-dark-text-secondary hover:border-primary-500 dark:hover:border-orange-500 hover:text-primary-600 dark:hover:text-orange-400 transition-all duration-300 shadow-sm"
                                                title="تعديل اسم المستخدم"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={handleSaveUsername}
                                                    disabled={isSavingUsername || !usernameValidation.isValid}
                                                    className="flex-1 sm:flex-none px-6 py-3.5 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 disabled:opacity-50 transition-all duration-300 shadow-sm hover:shadow-md"
                                                >
                                                    {isSavingUsername ? (
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            <span>حفظ</span>
                                                        </div>
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsEditingUsername(false);
                                                        setProfileSettings(prev => ({
                                                            ...prev,
                                                            username: user?.username || ''
                                                        }));
                                                        setUsernameValidation({ isValid: true, message: '', isChecking: false });
                                                    }}
                                                    className="flex-1 sm:flex-none px-6 py-3.5 bg-gray-100 dark:bg-dark-secondary text-gray-600 dark:text-dark-text-secondary font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-dark-tertiary transition-all duration-300"
                                                >
                                                    إلغاء
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Validation message - only show while editing */}
                                {isEditingUsername && usernameValidation.message && (
                                    <p className={`text-xs mt-2 ${usernameValidation.isValid
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                        }`}>
                                        {usernameValidation.message}
                                    </p>
                                )}

                                {/* URL preview */}
                                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-2">
                                    سيتم استخدام هذا الاسم في رابط ملفك الشخصي: /creators/{profileSettings.username || profileSettings.email?.split('@')[0] || 'username'}
                                </p>

                                {/* Username requirements - only show when editing */}
                                {isEditingUsername && (
                                    <div className="mt-3 p-3 bg-gray-50 dark:bg-dark-secondary rounded-lg">
                                        <p className="text-xs font-medium text-gray-700 dark:text-dark-text-primary mb-2">متطلبات اسم المستخدم:</p>
                                        <ul className="text-xs text-gray-600 dark:text-dark-text-secondary space-y-1">
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary-500 dark:text-orange-400 mt-0.5">•</span>
                                                <span>يجب أن يكون بين 3-20 حرف</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary-500 dark:text-orange-400 mt-0.5">•</span>
                                                <span>أحرف صغيرة وأرقام وشرطة سفلية فقط</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary-500 dark:text-orange-400 mt-0.5">•</span>
                                                <span>لا يمكن أن يبدأ أو ينتهي بشرطة سفلية</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary-500 dark:text-orange-400 mt-0.5">•</span>
                                                <span>لا يمكن أن يحتوي على شرطتين سفليتين متتاليتين</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary-500 dark:text-orange-400 mt-0.5">•</span>
                                                <span>يجب أن يكون فريداً وغير محجوز</span>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Display Name */}
                            <div className="space-y-3">
                                <label className="text-sm font-black text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    الاسم المعروض
                                </label>
                                <input
                                    type="text"
                                    value={profileSettings.displayName}
                                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                                    className="w-full px-5 py-3.5 bg-white dark:bg-dark-tertiary border-2 border-gray-200 dark:border-dark-card-border rounded-2xl text-gray-900 dark:text-dark-text-primary font-bold placeholder-gray-400 focus:border-primary-500 dark:focus:border-orange-500 focus:ring-0 transition-all duration-300"
                                    placeholder="أدخل اسمك المعروض"
                                />
                            </div>

                            {/* Bio */}
                            <div className="space-y-3">
                                <label className="text-sm font-black text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                    </svg>
                                    نبذة شخصية
                                </label>
                                <textarea
                                    value={profileSettings.bio}
                                    onChange={(e) => handleInputChange('bio', e.target.value)}
                                    className="w-full px-5 py-4 bg-white dark:bg-dark-tertiary border-2 border-gray-200 dark:border-dark-card-border rounded-2xl text-gray-900 dark:text-dark-text-primary font-medium placeholder-gray-400 focus:border-primary-500 dark:focus:border-orange-500 focus:ring-0 transition-all duration-300 min-h-[140px] resize-none"
                                    rows={4}
                                    placeholder="اكتب نبذة عن نفسك ومهاراتك..."
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                                        {profileSettings.bio.length}/500 حرف
                                    </p>
                                    <div className={`text-xs ${profileSettings.bio.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
                                        {profileSettings.bio.length > 450 ? 'اقتربت من الحد الأقصى' : ''}
                                    </div>
                                </div>
                            </div>

                            {/* Specialties */}
                            <div className="space-y-4">
                                <label className="text-sm font-black text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    المجالات والاهتمامات
                                </label>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {(profileSettings.specialties || []).map((specialty, index) => (
                                        <span
                                            key={index}
                                            className="group inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-text-primary text-sm font-bold rounded-xl border border-gray-200 dark:border-dark-card-border hover:border-primary-500 dark:hover:border-orange-500 transition-all duration-300"
                                        >
                                            {specialty}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newSpecialties = profileSettings.specialties.filter((_, i) => i !== index);
                                                    handleInputChange('specialties', newSpecialties);
                                                }}
                                                className="text-gray-400 group-hover:text-red-500 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </span>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={profileSettings.newSpecialty || ''}
                                        onChange={(e) => handleInputChange('newSpecialty', e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (profileSettings.newSpecialty && profileSettings.newSpecialty.trim()) {
                                                    const newSpecialties = [...(profileSettings.specialties || []), profileSettings.newSpecialty.trim()];
                                                    handleInputChange('specialties', newSpecialties);
                                                    handleInputChange('newSpecialty', '');
                                                }
                                            }
                                        }}
                                        className="flex-1 px-5 py-3.5 bg-white dark:bg-dark-tertiary border-2 border-gray-200 dark:border-dark-card-border rounded-2xl text-gray-900 dark:text-dark-text-primary font-bold placeholder-gray-400 focus:border-primary-500 dark:focus:border-orange-500 focus:ring-0 transition-all duration-300"
                                        placeholder="أضف مجال جديد (نوشن، تصميم...)"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (profileSettings.newSpecialty && profileSettings.newSpecialty.trim()) {
                                                const newSpecialties = [...(profileSettings.specialties || []), profileSettings.newSpecialty.trim()];
                                                handleInputChange('specialties', newSpecialties);
                                                handleInputChange('newSpecialty', '');
                                            }
                                        }}
                                        className="px-6 py-3.5 bg-primary-500 dark:bg-orange-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-all duration-300 shadow-sm"
                                    >
                                        إضافة
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6 lg:p-8 bg-gray-50/50 dark:bg-dark-tertiary/20 border-b border-gray-100 dark:border-dark-card-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-primary-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">روابط التواصل</h2>
                            </div>
                        </div>
                        <div className="p-6 lg:p-8 space-y-6">
                            {(profileSettings.socialLinks || []).map((link, index) => {
                                const platform = detectPlatform(link.url);
                                const isValid = !link.url || isValidSocialMediaUrl(link.url);
                                const hasError = link.url && !isValid;

                                return (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex-1 relative group">
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none transition-colors">
                                                {hasError ? (
                                                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                ) : platform ? (
                                                    <div className={`${platform.color}`}>
                                                        {getPlatformIcon(platform.icon)}
                                                    </div>
                                                ) : (
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                    </svg>
                                                )}
                                            </div>
                                            <input
                                                type="url"
                                                value={link.url || ''}
                                                onChange={(e) => updateSocialLink(index, e.target.value)}
                                                className={`w-full pl-4 pr-12 py-3.5 bg-white dark:bg-dark-tertiary border-2 rounded-2xl text-gray-900 dark:text-dark-text-primary font-medium placeholder-gray-400 focus:ring-0 transition-all duration-300 ${hasError
                                                    ? 'border-red-200 dark:border-red-900/50 focus:border-red-500'
                                                    : 'border-gray-200 dark:border-dark-card-border focus:border-primary-500 dark:focus:border-orange-500'
                                                    }`}
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeSocialLink(index)}
                                            className="p-3.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl border-2 border-transparent hover:border-red-100 transition-all duration-300"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                );
                            })}

                            <button
                                type="button"
                                onClick={addSocialLink}
                                className="w-full flex items-center justify-center gap-3 py-4 px-6 border-2 border-dashed border-gray-200 dark:border-dark-card-border rounded-2xl text-gray-500 dark:text-dark-text-secondary font-bold hover:border-primary-500 dark:hover:border-orange-500 hover:text-primary-600 dark:hover:text-orange-400 hover:bg-primary-50/30 dark:hover:bg-orange-900/10 transition-all duration-300"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                إضافة رابط جديد
                            </button>
                        </div>
                    </div>
                </div>

                {/* Side Settings */}
                <div className="space-y-6 lg:space-y-8">
                    {/* Privacy Settings */}
                    <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6 lg:p-8 bg-gray-50/50 dark:bg-dark-tertiary/20 border-b border-gray-100 dark:border-dark-card-border">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">الخصوصية</h2>
                        </div>
                        <div className="p-6 lg:p-8 space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-dark-tertiary/20 rounded-2xl border border-gray-100 dark:border-dark-card-border">
                                <div>
                                    <label className="text-sm font-black text-gray-900 dark:text-dark-text-primary leading-none">
                                        السماح بالرسائل
                                    </label>
                                    <p className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary mt-1">تلقي رسائل من المستخدمين</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer" dir="ltr">
                                    <input
                                        type="checkbox"
                                        checked={profileSettings.allowMessages}
                                        onChange={(e) => handleInputChange('allowMessages', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-500 dark:peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                </label>
                            </div>

                            {profileSettings.allowMessages && (
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-900 dark:text-dark-text-primary">بريد التواصل</label>
                                    <input
                                        type="email"
                                        value={profileSettings.contactEmail || ''}
                                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                                        className="w-full px-4 py-3 bg-white dark:bg-dark-tertiary border-2 border-gray-200 dark:border-dark-card-border rounded-xl text-sm font-bold placeholder-gray-400 focus:border-primary-500 dark:focus:border-orange-500 transition-all duration-300"
                                        placeholder="example@email.com"
                                    />
                                </div>
                            )}

                            <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-dark-tertiary/20 rounded-2xl border border-gray-100 dark:border-dark-card-border">
                                <div>
                                    <label className="text-sm font-black text-gray-900 dark:text-dark-text-primary leading-none">
                                        عدد القوالب
                                    </label>
                                    <p className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary mt-1">إظهار الإجمالي في ملفك</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer" dir="ltr">
                                    <input
                                        type="checkbox"
                                        checked={profileSettings.showTemplateCount}
                                        onChange={(e) => handleInputChange('showTemplateCount', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-500 dark:peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Account Actions */}
                    <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6 lg:p-8 bg-gray-50/50 dark:bg-dark-tertiary/20 border-b border-gray-100 dark:border-dark-card-border">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">خيارات أخرى</h2>
                        </div>
                        <div className="p-6 lg:p-8 space-y-3">
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-white dark:bg-dark-tertiary border-2 border-gray-100 dark:border-dark-card-border text-gray-700 dark:text-dark-text-primary font-bold rounded-2xl hover:border-primary-500 dark:hover:border-orange-500 hover:text-primary-600 dark:hover:text-orange-400 transition-all duration-300"
                            >
                                تغيير كلمة المرور
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-white dark:bg-dark-tertiary border-2 border-red-50 dark:border-red-900/10 text-red-500 font-bold rounded-2xl hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                            >
                                حذف الحساب نهائياً
                            </button>
                        </div>
                    </div>

                    {/* Notifications & Settings (merged/simplified for Bento) */}
                    <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6 lg:p-8 bg-gray-50/50 dark:bg-dark-tertiary/20 border-b border-gray-100 dark:border-dark-card-border">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">التفضيلات</h2>
                        </div>
                        <div className="p-6 lg:p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-black text-gray-900 dark:text-dark-text-primary">إشعارات النظام</label>
                                    <p className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary">تلقي تنبيهات بالأنشطة</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer" dir="ltr">
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications}
                                        onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-500 dark:peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-black text-gray-900 dark:text-dark-text-primary">بريد التحديثات</label>
                                    <p className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary">نشرة دورية للحساب</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer" dir="ltr">
                                    <input
                                        type="checkbox"
                                        checked={settings.emailUpdates}
                                        onChange={(e) => handleSettingChange('emailUpdates', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-500 dark:peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            {/* Delete Account Confirmation Modal */}
            {
                showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                        <div className="card-interactive max-w-md w-full p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                                    حذف الحساب نهائياً ⚠️
                                </h3>
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed mb-6">
                                    نحن نأسف لرؤيتك تترك مجتمع عرب نوشن. هذا الإجراء سيمحو حسابك وجميع بياناتك نهائياً ولا يمكن التراجع عنه.
                                </p>
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
                                    <h4 className="font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        سيتم حذف البيانات التالية نهائياً:
                                    </h4>
                                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-2">
                                        <li className="flex items-center gap-2">
                                            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            الملف الشخصي والمعلومات الشخصية
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            جميع المقالات والمدونات المنشورة
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            جميع القوالب والمحتوى المنشور
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            جميع التقييمات والتعليقات والمتابعات
                                        </li>
                                    </ul>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
                                    <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
                                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <span>
                                            <strong>اقتراح:</strong> يمكنك إيقاف حسابك مؤقتاً بدلاً من حذفه نهائياً. هذا سيمنع الآخرين من رؤية ملفك الشخصي مع الحفاظ على بياناتك.
                                        </span>
                                    </p>
                                </div>

                                <p className="text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-3">
                                    لتأكيد الحذف، اكتب <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">حذف</span> في المربع أدناه:
                                </p>
                            </div>

                            <div className="mb-4 sm:mb-6">
                                <input
                                    type="text"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    placeholder="اكتب 'حذف' هنا"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-card-border rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-text-primary text-sm sm:text-base focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    dir="rtl"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteConfirmation('');
                                    }}
                                    className="flex-1 btn-outline text-sm sm:text-base py-2 sm:py-3"
                                    disabled={isDeleting}
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting || deleteConfirmation !== 'حذف'}
                                    className="flex-1 px-4 py-2 sm:py-3 text-sm sm:text-base font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
                                >
                                    {isDeleting ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>جاري حذف الحساب...</span>
                                        </div>
                                    ) : (
                                        'حذف الحساب نهائياً'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Change Password Modal */}
            {
                showPasswordModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                        <div className="card-interactive max-w-md w-full p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                </div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
                                    تغيير كلمة المرور
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                                        كلمة المرور الحالية
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-text-primary text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${passwordErrors.currentPassword
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 dark:border-dark-card-border'
                                            }`}
                                        placeholder="أدخل كلمة المرور الحالية"
                                        dir="rtl"
                                    />
                                    {passwordErrors.currentPassword && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.currentPassword}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-tertiary">
                                        لا تتذكر كلمة المرور الحالية؟{' '}
                                        <Link
                                            href="/forgot-password"
                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                            onClick={() => setShowPasswordModal(false)}
                                        >
                                            انقر هنا لإعادة تعيينها
                                        </Link>
                                    </p>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                                        كلمة المرور الجديدة
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-text-primary text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${passwordErrors.newPassword
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 dark:border-dark-card-border'
                                            }`}
                                        placeholder="أدخل كلمة المرور الجديدة"
                                        dir="rtl"
                                    />
                                    {passwordErrors.newPassword && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.newPassword}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-tertiary">
                                        يجب أن تحتوي على 6 أحرف على الأقل مع حرف صغير وحرف كبير ورقم
                                    </p>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                                        تأكيد كلمة المرور الجديدة
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-text-primary text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${passwordErrors.confirmPassword
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 dark:border-dark-card-border'
                                            }`}
                                        placeholder="أعد إدخال كلمة المرور الجديدة"
                                        dir="rtl"
                                    />
                                    {passwordErrors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.confirmPassword}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                                <button
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordData({
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: ''
                                        });
                                        setPasswordErrors({});
                                    }}
                                    className="flex-1 btn-outline text-sm sm:text-base py-2 sm:py-3"
                                    disabled={isChangingPassword}
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleChangePassword}
                                    disabled={isChangingPassword}
                                    className="flex-1 btn-primary text-sm sm:text-base py-2 sm:py-3"
                                >
                                    {isChangingPassword ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>جاري التغيير...</span>
                                        </div>
                                    ) : (
                                        'تغيير كلمة المرور'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </>
    );
}
