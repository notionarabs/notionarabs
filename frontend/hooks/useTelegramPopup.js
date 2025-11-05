import { useState, useEffect } from 'react';

const TELEGRAM_POPUP_STORAGE_KEY = 'telegramPopupDismissed';
const SHOW_DELAY = 5000; // Show after 5 seconds
const SCROLL_THRESHOLD = 30; // Show after scrolling 30% of page

export function useTelegramPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (hasChecked || typeof window === 'undefined') {
      return;
    }

    // Check if popup was dismissed
    const isDismissed = localStorage.getItem(TELEGRAM_POPUP_STORAGE_KEY);
    if (isDismissed === 'true') {
      setHasChecked(true);
      return;
    }

    // Show popup after delay
    const delayTimer = setTimeout(() => {
      setShowPopup(true);
      setHasChecked(true);
    }, SHOW_DELAY);

    // Also show on scroll (optional - comment out if you don't want this behavior)
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercentage >= SCROLL_THRESHOLD && !showPopup) {
        clearTimeout(delayTimer);
        setShowPopup(true);
        setHasChecked(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(delayTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasChecked, showPopup]);

  const dismissPopup = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TELEGRAM_POPUP_STORAGE_KEY, 'true');
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

