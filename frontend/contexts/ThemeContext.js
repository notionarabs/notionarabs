'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Initialize theme from data attribute set by blocking script, or default to light
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    // Read the theme that was already set by the blocking script
    const dataTheme = document.documentElement.getAttribute('data-theme');
    if (dataTheme) return dataTheme;
    // Fallback to checking class or localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return systemTheme;
  });
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount - only sync, don't change if already correct
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Read the theme that was already set by the blocking script
    const dataTheme = document.documentElement.getAttribute('data-theme');
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    // Use the theme from data attribute (set by blocking script) if available, otherwise use saved or system
    const initialTheme = dataTheme || savedTheme || systemTheme;

    // Check if the theme is already correctly applied by the script
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';

    // Only update DOM if there's a mismatch (shouldn't happen if script worked correctly)
    // But don't change if it's already correct to avoid flash
    if (currentTheme !== initialTheme) {
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Sync the state without causing a re-render flash
    // Only update if different to avoid unnecessary re-renders
    setTheme(prevTheme => {
      if (prevTheme !== initialTheme) {
        return initialTheme;
      }
      return prevTheme;
    });
    setMounted(true);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle dark/light theme: Ctrl/Cmd + Shift + L (or Arabic equivalent م)
      const isKeyL = e.key?.toLowerCase() === 'l' || e.key === 'م' || e.code === 'KeyL';
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && isKeyL) {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [theme]); // Re-bind if theme state changes to ensure toggleTheme has latest state if needed (though toggleTheme uses state setter function)

  const toggleTheme = () => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {!mounted ? (
        <div className="min-h-screen bg-white dark:bg-gray-900" suppressHydrationWarning>{children}</div>
      ) : (
        children
      )}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
