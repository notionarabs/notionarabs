import { useState, useEffect } from 'react';

const TELEGRAM_POPUP_STORAGE_KEY = 'telegramPopupDismissed';
const SHOW_DELAY = 15000; // Show after 15 seconds (more time for user to engage)
const SCROLL_THRESHOLD = 50; // Show after scrolling 50% of page (more engagement)
const MIN_TIME_ON_PAGE = 10000; // Minimum 10 seconds on page before showing

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

    // Track time on page
    const startTime = Date.now();
    let hasShown = false;

    const checkAndShow = () => {
      if (hasShown) return;
      const timeOnPage = Date.now() - startTime;
      if (timeOnPage >= MIN_TIME_ON_PAGE) {
        setShowPopup(true);
        setHasChecked(true);
        hasShown = true;
        return true;
      }
      return false;
    };

    // Exit intent detection (mouse leaving to top of page)
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && checkAndShow()) {
        document.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    // Show popup after delay (only if user has been on page for minimum time)
    const delayTimer = setTimeout(() => {
      checkAndShow();
    }, SHOW_DELAY);

    // Show on scroll after significant engagement
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercentage >= SCROLL_THRESHOLD && checkAndShow()) {
        clearTimeout(delayTimer);
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(delayTimer);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
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

