import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const CREATOR_TELEGRAM_STORAGE_KEY = 'creatorTelegramDismissed';
const SHOW_DELAY = 5000; // Show after 5 seconds for creators

export function useCreatorTelegramPopup() {
    const { user, isAuthenticated } = useAuth();
    const [showPopup, setShowPopup] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        // Only show for approved creators
        if (!isAuthenticated || user?.creatorStatus !== 'approved') {
            return;
        }

        if (hasChecked || typeof window === 'undefined') {
            return;
        }

        // Check if popup was dismissed
        const isDismissed = localStorage.getItem(CREATOR_TELEGRAM_STORAGE_KEY);
        if (isDismissed === 'true') {
            setHasChecked(true);
            return;
        }

        // Show after delay
        const timer = setTimeout(() => {
            setShowPopup(true);
            setHasChecked(true);
        }, SHOW_DELAY);

        return () => clearTimeout(timer);
    }, [user, isAuthenticated, hasChecked]);

    const dismissPopup = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(CREATOR_TELEGRAM_STORAGE_KEY, 'true');
        }
        setShowPopup(false);
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    return {
        showPopup,
        dismissPopup,
        closePopup
    };
}
