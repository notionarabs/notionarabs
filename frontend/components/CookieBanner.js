'use client';

import { useState, useEffect } from 'react';
import { X, Settings, Check, XCircle } from 'lucide-react';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, can't be disabled
    functional: true,
    analytics: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Add delay before showing the banner
      const timer = setTimeout(() => {
        setIsVisible(true);
        // Trigger animation after a brief delay
        setTimeout(() => {
          setIsAnimating(true);
        }, 150);
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const newPreferences = {
      essential: true,
      functional: true,
      analytics: true
    };
    setPreferences(newPreferences);
    savePreferences(newPreferences);
    // Animate out before hiding
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  const handleAcceptNecessary = () => {
    const newPreferences = {
      essential: true,
      functional: false,
      analytics: false
    };
    setPreferences(newPreferences);
    savePreferences(newPreferences);
    // Animate out before hiding
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    // Animate out before hiding
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      setShowSettings(false);
    }, 300);
  };

  const savePreferences = (prefs) => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      preferences: prefs,
      timestamp: Date.now()
    }));

    // Apply preferences
    if (!prefs.analytics) {
      // Disable analytics cookies
      disableAnalyticsCookies();
    }

    if (!prefs.functional) {
      // Disable functional cookies
      disableFunctionalCookies();
    }
  };

  const disableAnalyticsCookies = () => {
    // Remove analytics cookies
    document.cookie = '_ga=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = '_gid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = '_gat=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  const disableFunctionalCookies = () => {
    // Remove functional cookies (but keep essential ones like authToken)
    // Add specific functional cookies here if any
  };

  const togglePreference = (type) => {
    if (type === 'essential') return; // Can't disable essential cookies

    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dark-secondary border-t border-gray-200 dark:border-dark-card-border shadow-lg transition-all duration-700 ease-out transform ${isAnimating
      ? 'translate-y-0 opacity-100 scale-100'
      : 'translate-y-full opacity-0 scale-95'
      }`}>
      <div className="container-custom px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto">
          {!showSettings ? (
            // Main banner
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-accent-900 dark:text-dark-text-primary mb-2">
                  نحن نستخدم ملفات تعريف الارتباط
                </h3>
                <p className="text-sm sm:text-base text-accent-700 dark:text-dark-text-secondary leading-relaxed">
                  نستخدم ملفات تعريف الارتباط لضمان عمل الموقع بشكل صحيح ولتحسين تجربتك.
                  يمكنك اختيار أنواع ملفات تعريف الارتباط التي تريد قبولها.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <button
                  onClick={handleAcceptNecessary}
                  className="px-4 py-2 text-sm font-medium text-accent-700 dark:text-dark-text-secondary bg-gray-100 dark:bg-dark-tertiary rounded-lg hover:bg-gray-200 dark:hover:bg-dark-card-border transition-colors"
                >
                  الضرورية فقط
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 text-sm font-medium text-accent-700 dark:text-dark-text-secondary bg-gray-100 dark:bg-dark-tertiary rounded-lg hover:bg-gray-200 dark:hover:bg-dark-card-border transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  الإعدادات
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
                >
                  قبول الكل
                </button>
              </div>
            </div>
          ) : (
            // Settings panel
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-accent-900 dark:text-dark-text-primary">
                  إعدادات ملفات تعريف الارتباط
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-accent-500 hover:text-accent-700 dark:text-dark-text-tertiary dark:hover:text-dark-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Essential Cookies */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-tertiary rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-accent-900 dark:text-dark-text-primary mb-1">
                      ملفات تعريف الارتباط الأساسية
                    </h4>
                    <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                      ضرورية لعمل الموقع وتسجيل الدخول. لا يمكن تعطيلها.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">مفعلة دائماً</span>
                  </div>
                </div>

                {/* Functional Cookies */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-accent-900 dark:text-dark-text-primary mb-1">
                      ملفات تعريف الارتباط الوظيفية
                    </h4>
                    <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                      تحسن تجربة الاستخدام وتذكر تفضيلاتك.
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference('functional')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.functional ? 'bg-primary-500' : 'bg-gray-200 dark:bg-dark-tertiary'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.functional ? '-translate-x-6' : '-translate-x-1'
                        }`}
                    />
                  </button>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-accent-900 dark:text-dark-text-primary mb-1">
                      ملفات تعريف الارتباط التحليلية
                    </h4>
                    <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                      تساعدنا في فهم كيفية استخدامك للموقع لتحسينه.
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference('analytics')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.analytics ? 'bg-primary-500' : 'bg-gray-200 dark:bg-dark-tertiary'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.analytics ? '-translate-x-6' : '-translate-x-1'
                        }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-sm font-medium text-accent-700 dark:text-dark-text-secondary bg-gray-100 dark:bg-dark-tertiary rounded-lg hover:bg-gray-200 dark:hover:bg-dark-card-border transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors flex-1 sm:flex-none"
                >
                  حفظ التفضيلات
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
